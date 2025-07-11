class UserAlreadyExists(Exception):
    def __init__(self, message="User with this email/username already exists."):
        super().__init__(message)


class InvalidCredentials(Exception):
    def __init__(self, message="Invalid username or password provided."):
        super().__init__(message)


class PasswordPattern(Exception):
    def __init__(self, message="Password does not meet the required pattern/criteria."):
        super().__init__(message)


class PriceInvalidException(Exception):
    def __init__(self, message="Price must be a positive number greater than zero."):
        super().__init__(message)


class ProductNotFoundException(Exception):
    def __init__(self, message="Requested product not found in the database."):
        super().__init__(message)


class StockUnavailableException(Exception):
    def __init__(self, message="Requested quantity exceeds available stock."):
        super().__init__(message)


class CartEmptyException(Exception):
    def __init__(self, message="Cart is empty. No items to process."):
        super().__init__(message)


class OrderNotFoundException(Exception):
    def __init__(self, message="No order found"):
        super().__init__(message)
