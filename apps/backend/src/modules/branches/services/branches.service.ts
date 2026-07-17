import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch, Room } from '../../organizations/entities/organization.entity';

@Injectable()
export class BranchesService {
  private readonly logger = new Logger(BranchesService.name);

  constructor(
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
  ) {}

  /**
   * Create a new branch under an organization
   */
  async create(
    organizationId: string,
    data: { name: string; slug: string; address?: string; timezone?: string },
  ): Promise<Branch> {
    const existing = await this.branchRepo.findOne({
      where: { organizationId, slug: data.slug },
    });
    if (existing) {
      throw new ConflictException(`Branch with slug '${data.slug}' already exists in this organization.`);
    }

    const branch = this.branchRepo.create({
      organizationId,
      name: data.name,
      slug: data.slug,
      address: data.address || null,
      timezone: data.timezone || 'UTC',
      status: 'active',
      settings: {},
    });

    return this.branchRepo.save(branch);
  }

  /**
   * Get all branches for an organization
   */
  async findAll(organizationId: string): Promise<Branch[]> {
    return this.branchRepo.find({ where: { organizationId } });
  }

  /**
   * Get a single branch
   */
  async findOne(id: string, organizationId: string): Promise<Branch> {
    const branch = await this.branchRepo.findOne({
      where: { id, organizationId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID '${id}' not found in this organization.`);
    }
    return branch;
  }

  /**
   * Update branch details
   */
  async update(
    id: string,
    organizationId: string,
    updateData: Partial<Branch>,
  ): Promise<Branch> {
    const branch = await this.findOne(id, organizationId);
    Object.assign(branch, updateData);
    return this.branchRepo.save(branch);
  }

  /**
   * Room CRUD: Create room under a branch
   */
  async createRoom(
    organizationId: string,
    branchId: string,
    data: { name: string; capacity?: number; equipmentList?: string[] },
  ): Promise<Room> {
    const branch = await this.branchRepo.findOne({
      where: { id: branchId, organizationId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch '${branchId}' not found.`);
    }

    const room = this.roomRepo.create({
      organizationId,
      branchId,
      name: data.name,
      capacity: data.capacity || null,
      equipmentList: data.equipmentList || [],
      status: 'available',
    });

    return this.roomRepo.save(room);
  }

  /**
   * Get rooms under a branch
   */
  async findRooms(branchId: string, organizationId: string): Promise<Room[]> {
    return this.roomRepo.find({ where: { branchId, organizationId } });
  }

  /**
   * Get a single room
   */
  async findOneRoom(roomId: string, organizationId: string): Promise<Room> {
    const room = await this.roomRepo.findOne({
      where: { id: roomId, organizationId },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID '${roomId}' not found.`);
    }
    return room;
  }

  /**
   * Update room details
   */
  async updateRoom(
    roomId: string,
    organizationId: string,
    updateData: Partial<Room>,
  ): Promise<Room> {
    const room = await this.findOneRoom(roomId, organizationId);
    Object.assign(room, updateData);
    return this.roomRepo.save(room);
  }

  /**
   * Delete room
   */
  async deleteRoom(roomId: string, organizationId: string): Promise<void> {
    const room = await this.findOneRoom(roomId, organizationId);
    await this.roomRepo.remove(room);
  }
}
