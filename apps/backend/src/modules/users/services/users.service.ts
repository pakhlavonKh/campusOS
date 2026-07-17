import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Membership, ParentLink } from '../entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Membership)
    private readonly membershipRepo: Repository<Membership>,
    @InjectRepository(ParentLink)
    private readonly parentLinkRepo: Repository<ParentLink>,
  ) {}

  /**
   * Find a user by ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found.`);
    }
    return user;
  }

  /**
   * Update user profile settings/info
   */
  async updateProfile(id: string, data: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, data);
    return this.userRepo.save(user);
  }

  /**
   * Create membership for a user in an organization/branch
   */
  async createMembership(
    userId: string,
    organizationId: string,
    branchId?: string,
  ): Promise<Membership> {
    await this.findOne(userId); // ensure user exists

    const existing = await this.membershipRepo.findOne({
      where: { userId, organizationId, branchId: branchId || null },
    });
    if (existing) {
      return existing;
    }

    const membership = this.membershipRepo.create({
      userId,
      organizationId,
      branchId: branchId || null,
      status: 'active',
    });

    return this.membershipRepo.save(membership);
  }

  /**
   * Get memberships of a user
   */
  async getMemberships(userId: string): Promise<Membership[]> {
    return this.membershipRepo.find({ where: { userId } });
  }

  /**
   * Update status of a membership (e.g. suspend)
   */
  async updateMembershipStatus(
    membershipId: string,
    status: 'active' | 'suspended' | 'inactive',
  ): Promise<Membership> {
    const membership = await this.membershipRepo.findOne({ where: { id: membershipId } });
    if (!membership) {
      throw new NotFoundException(`Membership with ID '${membershipId}' not found.`);
    }
    membership.status = status;
    return this.membershipRepo.save(membership);
  }

  /**
   * Link parent account to student account
   */
  async linkParentToStudent(parentId: string, studentId: string): Promise<ParentLink> {
    // Ensure both users exist
    const parent = await this.findOne(parentId);
    const student = await this.findOne(studentId);

    const existing = await this.parentLinkRepo.findOne({
      where: { parentId, studentId },
    });
    if (existing) {
      return existing;
    }

    const link = this.parentLinkRepo.create({ parentId, studentId });
    return this.parentLinkRepo.save(link);
  }

  /**
   * Get all student profiles linked to a parent
   */
  async getStudentsForParent(parentId: string): Promise<User[]> {
    const links = await this.parentLinkRepo.find({
      where: { parentId },
      relations: ['student'],
    });
    return links.map((link) => link.student);
  }

  /**
   * Get all parent profiles linked to a student
   */
  async getParentsForStudent(studentId: string): Promise<User[]> {
    const links = await this.parentLinkRepo.find({
      where: { studentId },
      relations: ['parent'],
    });
    return links.map((link) => link.parent);
  }
}
