# MSI v1 Token Revocation and Capabilities

## Overview

This document describes the implementation of token revocation support for Managed Service Identity (MSI) v1 in MSAL Go. The feature enables App Service and Service Fabric environments to use token revocation capabilities.

## Supported Environments

**IMPORTANT**: Token revocation functionality is currently supported ONLY in the following environments:
- App Service
- Service Fabric

Other environments (IMDS, CloudShell, AzureArc, AzureML) do not support token revocation at this time. While the client capabilities are passed to all environments for consistency, the token_sha256_to_refresh parameter is only used in the supported environments.

## API Changes

### Client Configuration

The ManagedIdentity client has been updated to support client capabilities:

```go
client, err := managedidentity.New(
    managedidentity.SystemAssigned(),
    managedidentity.WithClientCapabilities([]string{"cp1", "cp2"})
)
```

### Token Acquisition with Claims

Token acquisition now supports claims for token revocation:

```go
result, err := client.AcquireToken(
    context.Background(), 
    resource, 
    managedidentity.WithClaims("eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik5UZG1aak00")
)
```

## Token Refresh Mechanism

When a token in the cache needs to be refreshed due to token revocation:

1. The token is hashed using SHA-256
2. The hash is passed in the `token_sha256_to_refresh` parameter
3. The service validates the token hash and issues a new token

## Implementation Details

The token hashing implementation:

```go
func convertTokenToSHA256HashString(token string) string {
    hash := sha256.New()
    hash.Write([]byte(token))
    hashBytes := hash.Sum(nil)
    return hex.EncodeToString(hashBytes)
}
```

## Error Handling

Token revocation errors are processed according to standard MSAL error handling:

1. Invalid client capabilities result in validation errors
2. Service errors are propagated to the caller
3. Token refresh failures due to revocation trigger a full re-authentication