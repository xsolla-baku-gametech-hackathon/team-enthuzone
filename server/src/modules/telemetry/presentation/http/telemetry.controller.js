class TelemetryController {
  constructor({ telemetryService }) {
    this.telemetryService = telemetryService;
  }

  create = async (req, res) => {
    const telemetry = await this.telemetryService.ingest(req.body);
    res.status(202).json({ telemetry });
  };

  createBatch = async (req, res) => {
    const telemetry = await this.telemetryService.ingestBatch(req.body.events);
    res.status(202).json({ accepted: telemetry.length, telemetry });
  };

  list = async (req, res) => {
    const telemetry = await this.telemetryService.list(req.query);
    res.json({ telemetry, count: telemetry.length, limit: req.query.limit, offset: req.query.offset });
  };
}

module.exports = { TelemetryController };
