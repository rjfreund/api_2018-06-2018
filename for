Invalid macro definition.
git clone https://github.com/rjfreund/api.git
cd api
start
git status
help for
FOR %i IN doskey /history DO echo hi
set hist doskey /history && FOR %i IN hist DO echo hi
for /f "delims=" %x in doskey /history do echo %x
doskey /history
doskey /history > echo
doskey /history > for /f %i in ('more') do @echo %f
doskey /history > for /f %i in ('more') do @echo hi
doskey /history > for /f "delims='\n'" %i in ('more') do @echo hi
