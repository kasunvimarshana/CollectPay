<?php

namespace Application\Exceptions;

use Exception;

class ValidationException extends Exception
{
    protected $code = 422;
}
