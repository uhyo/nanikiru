# DB Doc

## Cloth (objectstore cloth)
  {
    "id": number(key path)
    "name":string
    "type":string(clothType) index
    "patterns":{"type":string;"size":number,"colors":[]}[]
    "group": number[](clothgroup.id) indexM
    //used times
    "used":number
    "status":string("active","washer") indexM
    //time info
    "made":Date,
    "lastuse":Date,(null?)
  }
## ClothGroup (objectstore clothgroup)
  {
    "id":number(key path)
    "name":string
    "made":Date,
  }

## Scheduler (objectstore scheduler)
  {
    "id":number(key path)
    "type":string("calender") index
    "name":string
    "made":Date
    "groups":number[](clothgroup.id) indexM
    "main":number[](clothgroup.id)	//main clothgroup
  }

## Daily cloth log (objectstore log)
  {
    "id":number(key path)
    "scheduler":number(scheduler.id) index
    "cloth":number[](cloth.id) index indexM
    "date":Date	//<= 00:00:00+09:00 index
  }
  +index "scheduler-date" [scheduler,date]

# localStorage doc
## lastScheduler
scheduler.id(default one)
## nohelp
"true"
## startup
"done"
