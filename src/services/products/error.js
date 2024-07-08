const generateInvalidProductDataError = ({ title,
    description,
    price,
    thumbnail,
    code,
    stock,
    status,
    category  }) => {
    return `Invalid product data:
    * title  : should be a non-empty string, received ${title} (${typeof title})
    * description : should be a non-empty string, received ${description} (${typeof description})
    * price   : should be a positive number, received ${price} (${typeof price})
    * stock   : should be a positive number, received ${stock} (${typeof stock})
    * code   : should be an alphanumeric string, received ${code} (${typeof code})
    * status   : should be a boolean value, received ${status} (${typeof status})
    * category   : should be a non-empty string, received ${category} (${typeof category})
    * thumbnail  : should be a non-empty array of images, received ${thumbnail} (${typeof thumbnail})
    * `
}

module.exports = { generateInvalidProductDataError }