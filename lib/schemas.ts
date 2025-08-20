import { z } from "zod"

export const ProjectMetaSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  reason: z.string().min(1, "Reason is required"),
  owner: z.string().min(1, "Owner is required"),
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  unit: z.string().min(1, "Unit is required"),
  productName: z.string().min(1, "Product name is required"),
  majorFunction: z.string().min(1, "Major function is required"),
  secondaryFunction: z.string().optional(),
  productClass: z.string().optional(),
  productFeatures: z.string().optional(),
  productPhoto: z.string().optional(),
  packaging: z.object({
    min: z.string(),
    out: z.string(),
  }),
})

export const AnalysisScopeSchema = z.object({
  lifecycle: z.enum(["Gate-to-Gate", "Cradle-to-Gate", "Cradle-to-Grave"]),
  processOverview: z.object({
    name: z.string().min(1, "Process name is required"),
    subProcesses: z.array(z.string()),
    description: z.string().optional(),
    drawingFile: z.string().optional(),
  }),
  dataQuality: z.object({
    temporal: z.string().min(1, "Temporal scope is required"),
    technical: z.string().min(1, "Technical scope is required"),
    geographic: z.string().min(1, "Geographic scope is required"),
    source: z.enum(["primary", "secondary", "mixed"]),
    dataSources: z.string().optional(),
    peerReview: z.string().optional(),
  }),
  exclusions: z.object({
    massCutoff: z.string().optional(),
    rules: z.string().optional(),
  }),
  assumptions: z.string().min(1, "Assumptions are required"),
  methodSet: z.literal("EF 3.1"),
  summary: z.string(),
})

export const LciItemSchema = z.object({
  id: z.string(),
  process: z.string().min(1, "Process is required"),
  flow: z.string().min(1, "Flow is required"),
  direction: z.enum(["in", "out"]),
  qty: z.number().min(0, "Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
})
