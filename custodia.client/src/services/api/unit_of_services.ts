import { assetRepository } from './asset_repository'
import { custodyRepository } from './custody_repository'
import { requestRepository } from './request_repository'
import { retirementRepository } from './retirement_repository'
import { sessionRepository } from './session_repository'

export const services = {
	session: sessionRepository,
	assets: assetRepository,
	custody: custodyRepository,
	requests: requestRepository,
	retirements: retirementRepository,
}
