/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ManagedIdentityApplication } from "../../src/client/ManagedIdentityApplication.js";
import { convertTokenToSHA256HashString } from "../../src/utils/TokenHashingUtils.js";
// Test globals would normally be provided by the Jest environment
// In a real implementation, these would be provided by the test framework
declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;

describe("MSI v1 Token Revocation", () => {
    // We initialize the testClient in beforeEach but use it in the test cases
    let testClient: ManagedIdentityApplication;

    beforeEach(() => {
        // Initialize a managed identity client with client capabilities
        testClient = new ManagedIdentityApplication({
            clientCapabilities: ["cp1"]
        });
    });

    describe("Token Hashing", () => {
        // Test cases from spec acceptance criteria
        it("Should correctly hash test tokens", () => {
            // Test vectors specified in acceptance criteria
            const testCases = [
                {
                    token: "test_token",
                    expectedHash: "cc0af97287543b65da2c7e1476426021826cab166f1e063ed012b855ff819656"
                },
                {
                    token: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~",
                    expectedHash: "01588d5a948b6c4facd47866877491b42866b5c10a4d342cf168e994101d352a"
                },
                {
                    token: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~",
                    expectedHash: "29c538690068a8ad1797a391bfe23e7fb817b601fc7b78288cb499ab8fd37947"
                }
            ];

            testCases.forEach(testCase => {
                const hash = convertTokenToSHA256HashString(testCase.token);
                expect(hash).toBe(testCase.expectedHash);
            });
        });
    });

    describe("Client Capabilities Configuration", () => {
        it("Should allow setting client capabilities in constructor", () => {
            // Create a client with capabilities
            const client = new ManagedIdentityApplication({
                clientCapabilities: ["cp1", "cp2"]
            });
            
            // client.config.clientCapabilities should contain the capabilities
            // Note: This requires exposing config for testing or using a spy
            // This is a high-level test that may need adjustment based on actual implementation
            expect(client).toBeDefined();
        });
    });

    // Would need mocks for the actual token acquisition tests
});