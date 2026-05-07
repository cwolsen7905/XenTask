#include <string.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <resolv.h>
#include "openssl/ssl.h"
#include "openssl/err.h"

#include "ssl.h"

SSL_CTX* InitServerCTX(void) {
    SSL_METHOD	*method;
    SSL_CTX		*ctx;

    OpenSSL_add_all_algorithms();  /* load & register all cryptos, etc. */
    SSL_load_error_strings();   /* load all error messages */

    method	= TLSv1_2_server_method();  /* create new server-method instance */
    ctx		= SSL_CTX_new(method);   /* create new context from method */

    if ( ctx == NULL ) {

        ERR_print_errors_fp(stderr);
        abort();

    }

    return ctx;

}