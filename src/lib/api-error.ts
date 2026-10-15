/** Shape of an axios error as far as the UI reads it. */
export interface ApiErrorLike {
  response?: { data?: { message?: string } };
  message?: string;
}
