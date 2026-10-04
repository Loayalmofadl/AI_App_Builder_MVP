import { z } from 'zod';

const ALLOWED_PATHS = ['index.html', 'styles.css', 'app.js'] as const;

const FileLanguageSchema = z.enum(['html', 'css', 'javascript']);

const GeneratedFileSchema = z.object({
  path: z.string().min(1).max(100),
  language: FileLanguageSchema,
  content: z.string().min(1).max(500_000),
});

export const ProjectGenerationSchema = z.object({
  projectName: z.string().min(1).max(200),
  files: z
    .array(GeneratedFileSchema)
    .min(1)
    .max(10)
    .refine(
      (files) => {
        const paths = files.map((f) => f.path);
        return new Set(paths).size === paths.length;
      },
      { message: 'Duplicate file paths are not allowed' }
    )
    .refine(
      (files) => files.every((f) => ALLOWED_PATHS.includes(f.path as any)),
      { message: `Only allowed paths: ${ALLOWED_PATHS.join(', ')}` }
    ),
});

export type ProjectGenerationInput = z.infer<typeof ProjectGenerationSchema>;

export { ALLOWED_PATHS, GeneratedFileSchema, FileLanguageSchema };
