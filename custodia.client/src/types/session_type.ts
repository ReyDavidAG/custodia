export type Role = 'member' | 'it' | 'accounting'

export interface Person {
	id: string
	employeeNumber: string
	fullName: string
	areaId: string
	areaName: string
	departmentName: string | null
	companyId: string
	companyCode: string
}

export interface Session {
	person: Person
	role: Role
	staffAreaIds: string[]
	isAccountant: boolean
}
