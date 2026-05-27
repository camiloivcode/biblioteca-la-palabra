class ApiResponse {
  static success(res, data, message = 'Operación exitosa', statusCode = 200, meta = null) {
    const response = { success: true, message, data };
    if (meta) response.meta = meta;
    return res.status(statusCode).json(response);
  }

  static created(res, data, message = 'Recurso creado exitosamente') {
    return res.status(201).json({ success: true, message, data });
  }

  static error(res, message = 'Error interno', statusCode = 500, errors = null) {
    const response = { success: false, message };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
  }

  static paginated(res, data, page, limit, total) {
    return res.status(200).json({
      success: true,
      message: 'Datos obtenidos correctamente',
      data,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
}

module.exports = ApiResponse;