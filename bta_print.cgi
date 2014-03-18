#!/bin/bash
echo "Access-Control-Allow-Origin: http://ishtar.sao.ru"
echo "Access-Control-Allow-Headers: Content-Type, X-Requested-With"
#echo "Access-Control-Expose-Headers: Location"
echo "Access-Control-Allow-Methods: POST, GET"
echo -e "Content-Type: multipart/form-data\n\n"
/usr/local/bin/bta_print 2>/dev/null
