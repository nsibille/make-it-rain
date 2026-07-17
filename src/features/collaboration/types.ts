export interface Annotation {
  id: string;
  node_id: string;
  author_id: string;
  body: string;
  created_at: string | null;
  author_email: string | null;
}

export type AnnotationCounts = Record<string, number>;
