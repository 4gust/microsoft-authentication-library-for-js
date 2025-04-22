# Managed Service Identity (MSI) Token Revocation

## Overview

The MSI token revocation functionality enables applications using Managed Service Identity in Azure to handle token revocation events properly. When a token is revoked, the application needs to acquire a new token rather than using a cached one.

## Supported Environments

Token revocation is currently supported only in the following environments:

- App Service
- Service Fabric

While client capabilities are passed to all environments for consistency, the token revocation functionality (using the token_sha256_to_refresh parameter) is only applied in the supported environments.

## How Token Revocation Works

### Flow Diagram - Token Revocation Event

When a token is revoked, the following occurs:

1. The client calls a resource with a token that has been revoked
2. The resource returns HTTP 401 + claims 
3. The client parses the response and extracts the claims
4. The client calls MSAL's `acquireToken` with the claims and client capabilities
5. MSAL looks up the old token in the local cache
6. MSAL calls the MSI endpoint with `xms_cc` (client capabilities) and `token_sha256_to_refresh` (hashed token)
7. The MSI service uses this information to bypass its cache and get a new token

### Implementation Details

#### Client Configuration

To enable token revocation handling, you need to initialize the ManagedIdentityApplication with client capabilities:

```javascript
const client = new ManagedIdentityApplication({
    clientCapabilities: ["cp1"]
});
```

#### Token Acquisition

When acquiring a token, you can include claims to indicate a token revocation scenario:

```javascript
const result = await client.acquireToken({
    resource: "https://resource",
    claims: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik5UZG1aak00..."
});
```

#### Implementation Behavior

When acquiring a token:

1. If claims are provided or a force refresh is requested:
   - MSAL will try to retrieve the current token from the cache
   - If a token is found, it will be hashed using SHA-256
   - This hash will be passed as the `token_sha256_to_refresh` parameter
   - The client capabilities will be passed as the `xms_cc` parameter
   - These parameters tell the service to bypass its cache for the specific token

2. During background token refresh:
   - The same process is followed to ensure proper token refresh

## Testing

To test token revocation:

1. Initialize a ManagedIdentityApplication with client capabilities
2. Set up a token request with claims (simulating a 401 response with WWW-Authenticate header)
3. Verify that the request to the MSI endpoint includes the `xms_cc` and `token_sha256_to_refresh` parameters

## Limitations

- Token revocation functionality only works in supported environments (App Service and Service Fabric)
- The application must be configured with client capabilities to use token revocation
- Claims must be provided from the 401 response to trigger the token revocation flow