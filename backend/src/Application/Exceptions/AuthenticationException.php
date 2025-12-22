<?php

namespace Application\Exceptions;

use Exception;

class AuthenticationException extends Exception
{
    protected $code = 401;
}
