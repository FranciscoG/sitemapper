#!/bin/bash

# Colors!
# Black        0;30     Dark Gray     1;30
# Blue         0;34     Light Blue    1;34
# Green        0;32     Light Green   1;32
# Cyan         0;36     Light Cyan    1;36
# Red          0;31     Light Red     1;31
# Purple       0;35     Light Purple  1;35
# Brown/Orange 0;33     Yellow        1;33
# Light Gray   0;37     White         1;37

green='\033[0;32m'
red='\033[0;31m'
yellow='\033[0;33m'
lightblue='\033[0;34m'
NC='\033[0m' # No Color

wget="$(which wget)"

if [ ! -f $wget ]; then
  echo wget not installed, please download and install it first and start this script again
  echo you can get it here:  http://www.merenbach.com/software/wget/
  exit 1
fi

# source of getting arguments via bash: http://stackoverflow.com/a/14203146/395414
#
# Use > 1 to consume two arguments per pass in the loop (e.g. each
# argument has a corresponding value to go with it).
# Use > 0 to consume one or more arguments per pass in the loop (e.g.
# some arguments don't have a corresponding value to go with it such
# as in the --default example).
# note: if this is set to > 0 the /etc/hosts part is not recognized ( may be a bug )
# 
# example:  ./myscript.sh -e conf -s /etc -l /usr/lib /etc/hosts
while [[ $# > 0 ]]
do
key="$1"

case $key in
    -u|--url)
    URL="$2"
    shift # past argument
    ;;
    -l|--login)
    LOGIN="$2"
    shift # past argument
    ;;
    -p|--password)
    PASSWORD="$2"
    shift # past argument
    ;;
    -v|--verbose)
    VERBOSE=YES
    ;;
    *)
    ;;
esac
shift # past argument or value
done

# Show parameters available
if [ -z "$key" ]; then
    echo -e "Basic example:"
    echo -e "-u or --url:        The full URL ${red}(required!)${NC}"
    echo -e "-l or --login:      The username for basic http auth"
    echo -e "-p or --password:   The password for basic http auth"
    echo -e "-v or --verbose:    Show verbose output from wget"
    exit 1
fi

FLAGVERBOSE='--no-verbose'
FLAGLOGIN=''
FLAGPASSWORD=''

if [ -z "$URL" ]; then
  echo -e "You must enter a URL"
  exit 1
fi

echo -e "URL = ${green}${URL}${NC}"


if [ ! -z "$LOGIN" ]; then
  FLAGLOGIN="--http-user=$LOGIN"
  if [ -z "$PASSWORD" ]; then
    echo "Please enter a password using with -p"
    exit 1
  fi
fi

if [ ! -z "$PASSWORD" ]; then
  FLAGPASSWORD="--http-password=$PASSWORD"
  if [ -z "$LOGIN" ]; then
    echo "Please enter a login/username using with -l"
    exit 1
  fi
fi

# if verbose flag is set then we remove the no-verbose flag
# yes it's a little backwards, deal with it
if [ ! -z "$VERBOSE" ]; then
  FLAGVERBOSE=''
fi

#wget --spider --recursive --no-verbose --wait=1 --output-file=wgetlog.txt --http-user=$LOGIN --http-password=$PASSWORD $URL
wget --spider --recursive `echo $FLAGVERBOSE` --output-file=wgetlog.txt `echo $FLAGLOGIN` `echo $FLAGPASSWORD` $URL && \
sed -n "s@.\+ URL:\([^ ]\+\) .\+@\1@p" wgetlog.txt | sed "s@&@\&amp;@" > sedlog.txt