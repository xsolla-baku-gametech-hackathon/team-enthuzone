class TelemetryController {
  constructor({ telemetryService }) {
    this.telemetryService = telemetryService;
  }

  create = async (req, res) => {
    const telemetry = await this.telemetryService.ingest(req.body);
    res.status(202).json({ telemetry });
  };

  createBatch = async (req, res) => {