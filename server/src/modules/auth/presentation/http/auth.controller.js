class AuthController {
  constructor({ authService }) {
    this.register = async (req, res) => {
      const result = await authService.register(req.body);
      res.status(201).json(result);