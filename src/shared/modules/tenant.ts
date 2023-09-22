const ORG_TENANT_PREFIX = 'org_';

export function isTenantIdWithOrgId(tenantId = '') {
    return tenantId.startsWith(ORG_TENANT_PREFIX);
}

export function makeTenantIdFromOrgId(orgId: string) {
    return ORG_TENANT_PREFIX + orgId;
}

export function getOrgIdFromTenantId(tenantId: string) {
    return tenantId.slice(ORG_TENANT_PREFIX.length);
}
