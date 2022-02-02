//POC for error handling -- to be tested in FE as well
function errorHandler(error, request, response, next) {
	return response.status(error.status || 500).json({
		error: {
			message: error.message || "Oops Something went wrong.",
		}
	});
}

module.exports = errorHandler;