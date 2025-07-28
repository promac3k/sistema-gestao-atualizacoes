
function string_json(res, status, text, data) {
   var datetime = new Date().toISOString();
   const success_text = status === 200 ? true : false;
   return res.status(status).json({
      success: success_text,
      code: status,
      message: text,
      data: data,
      datetime: datetime
   });
}

module.exports = string_json;