# DB Doc

## Cloth (objectstore cloth)
  {
    "id": number(key path)
    "name":string
    "type":string(clothType) index
    "patterns":{"type":string;"colors":[]}[]
    "group": number[](clothgroup.id) indexM
    //used times
    "used":number
    "status":string("active","washer") indexM
    //time info
    "made":Date,
    "lastuse":Date,
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
  }

## Daily cloth log (objectstore log)
  {
    "id":number(key path)
    "scheduler":number(scheduler.id) index
    "cloth":number[](cloth.id) index indexM
    "date":Date
  }

# localStorage doc
## lastScheduler
scheduler.id(default one)

