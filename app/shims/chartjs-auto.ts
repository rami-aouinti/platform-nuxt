export type ChartConfiguration = {
  type?: string
  data?: unknown
  options?: unknown
}

export default class Chart {
  constructor(
    _context: CanvasRenderingContext2D | HTMLCanvasElement | null,
    _config: ChartConfiguration,
  ) {}

  destroy() {}

  update() {}
}
