import React, { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { usersService, UserMembership } from '../../api/services/users.service';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'active' | 'suspended';
  avatar: string;
}

export function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'student' | 'teacher' | 'admin'>('student');

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await usersService.getMyMemberships();
        if (res.success && res.data) {
          const mapped: SystemUser[] = res.data.map((m: UserMembership) => ({
            id: m.id,
            name: m.user?.firstName ? `${m.user.firstName} ${m.user.lastName || ''}`.trim() : m.user?.email || 'User',
            email: m.user?.email || 'user@campusos.edu',
            role: (m.user?.roles?.[0] as any) || 'student',
            status: m.status === 'suspended' ? 'suspended' : 'active',
            avatar: (m.user?.firstName?.[0] || 'U').toUpperCase(),
          }));
          setUsers(mapped);
        }
      } catch (err) {
        console.warn('Backend user endpoint unreachable or returned empty dataset.', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const initials = newName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'US';

    const createdLocally: SystemUser = {
      id: Date.now().toString(),
      name: newName,
      email: newEmail,
      role: newRole,
      status: 'active',
      avatar: initials,
    };

    try {
      await usersService.createMembership({
        userId: createdLocally.id,
        organizationId: 'default-org',
      });
    } catch (err) {
      console.warn('Membership endpoint mock fallback.', err);
    }

    setUsers([createdLocally, ...users]);
    setNewName('');
    setNewEmail('');
    setShowModal(false);
  };

  const toggleStatus = async (id: string) => {
    const target = users.find((u) => u.id === id);
    const newStatus = target?.status === 'active' ? 'suspended' : 'active';
    
    try {
      await usersService.updateMembershipStatus(id, newStatus);
    } catch (err) {
      console.warn('Status update API fallback.', err);
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: newStatus }
          : u
      )
    );
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Users Management</h1>
          <p>Manage faculty members, students, and system administrative accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div className="topbar-search" style={{ flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="form-input"
          style={{ width: 'auto', minWidth: '150px' }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="teacher">Teachers / Faculty</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Fetching user memberships from backend...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <p>No user accounts found. Click "Add User" to invite a new user.</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.8125rem' }}>
                        {u.avatar}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className={`badge ${
                        u.role === 'admin'
                          ? 'badge-purple'
                          : u.role === 'teacher'
                          ? 'badge-info'
                          : 'badge-success'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleStatus(u.id)}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '450px', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Add New User Account</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Dr. Alex Mercer"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="alex.mercer@campusos.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-input"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher / Faculty</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
