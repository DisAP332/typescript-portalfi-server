import { Schema, Connection, Model, SchemaDefinition } from "mongoose";

// Builds a per-tenant model factory from a schema definition. A per-tenant
// connection is cached (useDb, useCache: true) and reused across requests,
// so model() can only be called on it once - registering again on the same
// connection throws OverwriteModelError, hence the models[] guard.
//
// configureSchema runs on the schema before any connection ever compiles
// it, so virtuals/plugins registered there always attach correctly - unlike
// calling schema.virtual() after model(), which is a silent no-op.
export function createContentModel<T>(
  modelName: string,
  schemaDefinition: SchemaDefinition,
  configureSchema?: (schema: Schema<T>) => void
) {
  const schema = new Schema<T>(schemaDefinition);
  if (configureSchema) configureSchema(schema);

  return (connection: Connection): Model<T> =>
    (connection.models[modelName] as Model<T>) ??
    connection.model<T>(modelName, schema);
}
