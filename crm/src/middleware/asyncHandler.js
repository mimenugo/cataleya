// Express 4 no atrapa rechazos de promesas en handlers async; sin esto,
// un error en una ruta async se convierte en un unhandledRejection y tumba el proceso.
export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
