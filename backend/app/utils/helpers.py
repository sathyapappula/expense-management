import math
from datetime import date


def paginate(page: int, page_size: int):
    skip = (page - 1) * page_size
    return skip, page_size


def total_pages(total: int, page_size: int) -> int:
    return math.ceil(total / page_size) if total > 0 else 1


def current_year() -> int:
    return date.today().year


def current_month() -> int:
    return date.today().month
