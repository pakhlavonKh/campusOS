export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    timestamp: string;
}
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
    timestamp: string;
}
export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    meta: PaginationMeta;
    timestamp: string;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
}
export interface JwtPayload {
    sub: string;
    orgId: string;
    branchId: string;
    roles: string[];
    permissions: string[];
    iat: number;
    exp: number;
    jti: string;
    mfa: boolean;
    sessionId: string;
}
export interface TenantContext {
    organizationId: string;
    branchId?: string;
    userId: string;
    roles: string[];
}
//# sourceMappingURL=api.types.d.ts.map