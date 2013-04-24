# DB Doc

## Cloth (objectstore cloth)
  {
    "id": number(key path)
    "type":string(clothType)
    "colors":string[]
    "group": number[](clothgroup.id)
    //used times
    "used":number
    "status":string("active","washer")
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
    "type":string("calender")
    "name":string
    "made":Date
  }

## Daily cloth log (objectstore log)
  {
    "id":number(key path)
    "scheduler":number(scheduler.id)
    "cloth":number[](cloth.id)
    "date":Date
  }

# localStorage doc
## lastScheduler
scheduler.id(default one)

