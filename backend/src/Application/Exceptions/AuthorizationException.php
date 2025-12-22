<?php

namespace Application\Exceptions;

use Exception;

class AuthorizationException extends Exception
{
    protected $code = 403;
}
