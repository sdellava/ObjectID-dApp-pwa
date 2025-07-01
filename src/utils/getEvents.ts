import { GraphQLQueryResult, IotaGraphQLClient } from "@iota/iota-sdk/graphql";
import {} from "@iota/iota-sdk/graphql";

import gql from "graphql-tag";

export interface StructField {
  name: string;
  value: { Address?: number[]; String?: string; Number?: string; UID?: number[] };
}

export interface ObjectEdge {
  node: {
    address: string;
    asMoveObject?: {
      contents?: {
        type?: {
          repr?: string;
        };
        data?: {
          Struct: StructField[];
        };
      };
    };
  };
}

export interface QueryResult {
  objects: {
    edges: ObjectEdge[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

export const searchObjectsByTypeAndOwnerAddress = async (
  objectType: string,
  addressFilter: string,
  graphqlProvider: string
) => {
  const gqlClient = new IotaGraphQLClient({
    url: graphqlProvider,
  });

  try {
    const queryObjects = gql(`
  query ($type: String!, $after: String, $address: IotaAddress) {
    objects(filter: { type: $type, owner: $address }, first: 50, after: $after) {
      edges {
        node {
          address
          asMoveObject {
            contents {
              type {
                repr
              }
              data
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

    let allEdges: ObjectEdge[] = [];
    let hasNextPage = true;
    let endCursor: string | null = null;

    while (hasNextPage) {
      const result: GraphQLQueryResult<QueryResult> = await gqlClient.query<QueryResult>({
        query: queryObjects,
        variables: { type: objectType, after: endCursor, address: addressFilter },
      });

      if (!result?.data?.objects?.edges) {
        throw new Error("No data returned from the GraphQL query.");
      }

      allEdges = [...allEdges, ...result.data.objects.edges];

      hasNextPage = result.data.objects.pageInfo.hasNextPage;
      endCursor = result.data.objects.pageInfo.endCursor;
    }

    return allEdges;
  } catch (err: unknown) {
    if (err instanceof Error) {
      //console.error("General Error:", err.message);
    }

    type GraphQLErrorType = {
      networkError?: Record<string, unknown>;
      graphQLErrors?: Array<Record<string, unknown>>;
    };

    const graphQLError = err as GraphQLErrorType;

    if (graphQLError.networkError) {
      //console.error("Network Error:", graphQLError.networkError);
      return [];
    }

    if (graphQLError.graphQLErrors) {
      //console.error("GraphQL Errors:", graphQLError.graphQLErrors);
      return [];
    }

    return [];
  }
};
