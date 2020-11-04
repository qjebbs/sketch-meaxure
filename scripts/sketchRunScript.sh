#!/bin/sh

cwd=$(cd `dirname $0`; pwd)
sh $cwd/sketchtool.sh run ~/Library/Application\ Support/com.bohemiancoding.sketch3/Plugins/sketch-meaxure.sketchplugin commandRunScript --context="{ \"script\": \"$1\" }" -Q YES