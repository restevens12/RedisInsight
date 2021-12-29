// Urls for using in the tests
export const commonUrl = process.env.COMMON_URL || 'http://localhost:8080';

export const ossStandaloneConfig = {
    host: process.env.OSS_STANDALONE_HOST || 'localhost',
    port: process.env.OSS_STANDALONE_PORT || '8100',
    databaseName: process.env.OSS_STANDALONE_DATABASE_NAME || 'test_standalone',
    databaseUsername: process.env.OSS_STANDALONE_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_PASSWORD
};

export const ossStandaloneV5Config = {
    host: process.env.OSS_STANDALONE_V5_HOST || 'localhost',
    port: process.env.OSS_STANDALONE_V5_PORT || '8101',
    databaseName: process.env.OSS_STANDALONE_V5_DATABASE_NAME || 'test_standalone-v5',
    databaseUsername: process.env.OSS_STANDALONE_V5_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_V5_PASSWORD
};

export const ossStandaloneRedisearch = {
    host: process.env.OSS_STANDALONE_REDISEARCH_HOST || 'localhost',
    port: process.env.OSS_STANDALONE_REDISEARCH_PORT || '8102',
    databaseName: process.env.OSS_STANDALONE_REDISEARCH_DATABASE_NAME || 'test_standalone-redisearch',
    databaseUsername: process.env.OSS_STANDALONE_REDISEARCH_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_REDISEARCH_PASSWORD
};

export const ossClusterConfig = {
    ossClusterHost: process.env.OSS_CLUSTER_HOST || 'localhost',
    ossClusterPort: process.env.OSS_CLUSTER_PORT || '8200',
    ossClusterDatabaseName: process.env.OSS_CLUSTER_DATABASE_NAME || 'test_cluster'
};

export const ossSentinelConfig = {
    sentinelHost: process.env.OSS_SENTINEL_HOST || 'localhost',
    sentinelPort: process.env.OSS_SENTINEL_PORT || '28100',
    sentinelPassword: process.env.OSS_SENTINEL_PASSWORD || 'defaultpass'
};

export const redisEnterpriseClusterConfig = {
    host: process.env.RE_CLUSTER_HOST || 'localhost',
    port: process.env.RE_CLUSTER_PORT || '8300',
    databaseName: process.env.RE_CLUSTER_DATABASE_NAME || 'test-re-standalone',
    databaseUsername: process.env.RE_CLUSTER_ADMIN_USER || 'demo@redislabs.com',
    databasePassword: process.env.RE_CLUSTER_ADMIN_PASSWORD || '123456'
};

export const invalidOssStandaloneConfig = {
    host: process.env.OSS_STANDALONE_HOST || 'localhost',
    port: process.env.OSS_STANDALONE_PORT || '1010',
    databaseName: process.env.OSS_STANDALONE_DATABASE_NAME || 'test_standalone-invalid',
    databaseUsername: process.env.OSS_STANDALONE_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_PASSWORD
};
