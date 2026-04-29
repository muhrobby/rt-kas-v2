export type MockAuthRole = "admin" | "warga"

export interface LoginFormState {
  phone: string
  password: string
  role: MockAuthRole
}
