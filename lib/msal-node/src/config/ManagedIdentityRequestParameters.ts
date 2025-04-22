/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    RequestParameterBuilder,
    UrlString,
    UrlUtils,
} from "@azure/msal-common";
import { DefaultManagedIdentityRetryPolicy } from "../retry/DefaultManagedIdentityRetryPolicy.js";
import { 
    HttpMethod, 
    RetryPolicies, 
    CLIENT_CAPABILITIES_QUERY_PARAMETER_NAME,
    TOKEN_SHA256_TO_REFRESH_QUERY_PARAMETER_NAME 
} from "../utils/Constants.js";
import { convertTokenToSHA256HashString } from "../utils/TokenHashingUtils.js";

export class ManagedIdentityRequestParameters {
    private _baseEndpoint: string;
    public httpMethod: HttpMethod;
    public headers: Record<string, string>;
    public bodyParameters: Record<string, string>;
    public queryParameters: Record<string, string>;
    public retryPolicy: RetryPolicies;

    constructor(
        httpMethod: HttpMethod,
        endpoint: string,
        retryPolicy?: RetryPolicies
    ) {
        this.httpMethod = httpMethod;
        this._baseEndpoint = endpoint;
        this.headers = {} as Record<string, string>;
        this.bodyParameters = {} as Record<string, string>;
        this.queryParameters = {} as Record<string, string>;

        this.retryPolicy =
            retryPolicy || new DefaultManagedIdentityRetryPolicy();
    }

    public computeUri(): string {
        const parameters = new Map<string, string>();

        if (this.queryParameters) {
            RequestParameterBuilder.addExtraQueryParameters(
                parameters,
                this.queryParameters
            );
        }

        const queryParametersString = UrlUtils.mapToQueryString(parameters);

        return UrlString.appendQueryString(
            this._baseEndpoint,
            queryParametersString
        );
    }

    public computeParametersBodyString(): string {
        const parameters = new Map<string, string>();

        if (this.bodyParameters) {
            RequestParameterBuilder.addExtraQueryParameters(
                parameters,
                this.bodyParameters
            );
        }

        return UrlUtils.mapToQueryString(parameters);
    }

    /**
     * Adds client capabilities to the request parameters
     * @param clientCapabilities - Array of client capabilities
     */
    public addClientCapabilities(clientCapabilities?: string[]): void {
        if (clientCapabilities && clientCapabilities.length > 0) {
            this.queryParameters[CLIENT_CAPABILITIES_QUERY_PARAMETER_NAME] = clientCapabilities.join(',');
        }
    }

    /**
     * Adds token hash for token revocation
     * @param token - The token to hash and add to request
     */
    public addTokenToRefresh(token?: string): void {
        if (token) {
            const tokenHash = convertTokenToSHA256HashString(token);
            this.queryParameters[TOKEN_SHA256_TO_REFRESH_QUERY_PARAMETER_NAME] = tokenHash;
        }
    }
}
