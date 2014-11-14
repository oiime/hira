function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define('STATUS_ACTIVE', 1);
define('STATUS_INACTIVE', 2);
define('STATUS_PENDING', 3);
define('STATUS_DELETED', 10);

define('ROLE_USER', 1);
define('ROLE_ADMIN', 2);
