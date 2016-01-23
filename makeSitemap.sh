#!/usr/bin/env bash

##################################################################################
# wget shell script sitemap generator
#
# Helpful sources:
# 
# http://stackoverflow.com/questions/12498304/using-bash-to-display-a-progress-working-indicator
# source of getting arguments via bash: http://stackoverflow.com/a/14203146/395414
# http://www.lostsaloon.com/technology/how-to-create-an-xml-sitemap-using-wget-and-shell-script/
#
###################################################################################

set -o errexit
set -o pipefail
# set -o nounset
# set -o xtrace

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
  echo "wget not installed, please download and install it first and start this script again"
  echo "you can get it here:  http://www.merenbach.com/software/wget/"
  exit 1
fi

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
    exit 1
fi

if [ -z "$URL" ]; then
  echo -e "You must enter a URL"
  exit 1
fi

echo -e "Crawling: ${green}${URL}${NC}"
FLAGLOGIN=""
FLAGPW=""

if [ ! -z "$LOGIN" ]; then
  FLAGLOGIN="--http-user=$LOGIN"
  if [ -z "$PASSWORD" ]; then
    echo "Please enter a password using -p or --password"
    exit 1
  fi
fi

if [ ! -z "$PASSWORD" ]; then
  FLAGPW="--http-password=$PASSWORD"
  if [ -z "$LOGIN" ]; then
    echo "Please enter a login/username using -l or --login"
    exit 1
  fi
fi

baseWget () {
  ###
  # wget manual https://www.gnu.org/software/wget/manual/wget.html#Recursive-Download
  # -r   recursive
  # -nv  no verbose
  # -w   wait 1 second between requests
  # --delete-after  delete downloaded content
  # -o   output file 
  # -l   level depth of recursion
  # $@   print all arguments given to this function
  ###
  wget --spider -l 10 -r -nv -w 1 --delete-after -o wgetlog.txt $@
}

startSpider () {
  baseWget `echo $FLAGLOGIN` `echo $FLAGPW` $URL
}

filterLog () {
  grep -i URL wgetlog.txt | awk -F 'URL:' '{print $2}' | awk '{$1=$1};1' | awk '{print $1}' | sort -u | sed '/^$/d' > sortedlinks.txt
}

makeXML () {
  header='<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' 
  echo $header > sitemap.xml
  anyfileExt=".*\.[a-z]{2,3}$"
  while read p; do
    if [[ ! $p =~ $anyfileExt ]] ; then printf "<url>\n\t<loc>"$p"</loc>\n</url>\n" >> sitemap.xml; fi
  done < sortedlinks.txt
  echo "</urlset>" >> sitemap.xml
}

cleanUp () {
  # for some reason, even when using the --spider flag, it's still downloading and keeping the entire website
  # so I'm testing to see if it exists and deleting it if it does
  var=$URL
  CURR_DIR="$( echo "$var" | sed -E 's#https?://##;' )"
  if [ -d "$CURR_DIR" ]; then
    echo "removing local directory: $CURR_DIR"
    rm -rf $CURR_DIR
  fi

  # remove our 2 temporary files
  rm wgetlog.txt
  rm sortedlinks.txt
}

startSpider &
pid=$! # Process Id of the previous running command

spin='-\|/'

i=0
while kill -0 $pid 2>/dev/null
do
  i=$(( (i+1) %4 ))
  printf "\r${spin:$i:1}"
  sleep .1
done
filterLog && makeXML && cleanUp