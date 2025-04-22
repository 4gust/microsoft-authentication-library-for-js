/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as crypto from 'crypto';

/**
 * Computes the SHA-256 hash of a token and returns it as a hex string.
 * This is used for token revocation with managed identities.
 * 
 * @param token - The token to hash
 * @returns Hex string representation of the SHA-256 hash
 */
export function convertTokenToSHA256HashString(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}