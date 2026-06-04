import mongoose, { type Document, type Model, Schema } from "mongoose";

export type AgentStatus = "success" | "failure" | "running";

export interface IAgentLog extends Document {
  agentId: string;
  agentName: string;
  action: string;
  status: AgentStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  duration: number;
  metadata: Map<string, unknown>;
  executedAt: Date;
  createdAt: Date;
}

const agentLogSchema = new Schema<IAgentLog>(
  {
    agentId: { type: String, required: true },
    agentName: { type: String, required: true },
    action: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["success", "failure", "running"],
    },
    input: { type: Schema.Types.Mixed, default: {} },
    output: { type: Schema.Types.Mixed, default: null },
    error: { type: String, default: null },
    duration: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
    executedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

agentLogSchema.index({ agentId: 1, executedAt: -1 });
agentLogSchema.index({ status: 1, executedAt: -1 });
agentLogSchema.index({ agentName: 1, executedAt: -1 });
agentLogSchema.index({ executedAt: -1 });
agentLogSchema.index({ action: 1, status: 1 });

export const AgentLog: Model<IAgentLog> =
  mongoose.models.AgentLog ??
  mongoose.model<IAgentLog>("AgentLog", agentLogSchema);
