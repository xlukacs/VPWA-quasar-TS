import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/**
 * Blocks ALL API access when DEMO_LOCKED=true.
 * Used for portfolio/showcase deployments where the app
 * should be visible but not usable.
 */
export default class DemoGuard {
  public async handle({ response }: HttpContextContract, next: () => Promise<void>) {
    const isLocked = process.env.DEMO_LOCKED === 'true'

    if (isLocked) {
      return response.status(403).json({
        error: 'This application is a portfolio showcase. Access is disabled.',
      })
    }

    await next()
  }
}
