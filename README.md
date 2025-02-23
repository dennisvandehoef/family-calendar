# family-calendar

Custom Home Assistant card to display multiple calendars in a responsive version of a classical family calender. You know, the one with a column per person.

This is still under development and not ready to be used.


## Open Todo's

### Rudimental functionallity
- [x] Create basic card JS framework code
- [x] Add basic calander HTML
- [x] Be able to configure number of columns, column title & calendars per column
- [x] Show events ...
  - [x] on the correct days
  - [x] multiple events same time
  - [x] multi day events
    - [x] middle of calendar
    - [x] starting before first visible day
    - [x] ending after last visible day
  - [x] full day events
    - [x] middle of calendar
- [ ] Show card in list of cards
- [x] basic layout

### first improvements

These are future planned improvements, the implementation sequence can be different than listed below.

- [ ] suport visual config editor
- [ ] configure a color per calendar
- [ ] add support for card-mod
- [ ] optionally show wheather forcast to date
- [ ] configure the visible days
  - [ ] configre to always start on
    - [ ] today
    - [ ] weekday
    - [ ] the first of the month
    - [ ] Show x days or till end of month
- [ ] add possibility to translate
- [ ] configure date format
- [ ] show details in popup
- [ ] display not-yet accepted differently
- [ ] option to hide/show redjected
- [ ] Use less space to display events
  - [ ] optimised width
    - [ ] 3 events, that can be displayed in 2 columns without overlapping should be displayed in 2 columns instead of 3
  - [ ] optimised height
    - [ ] If an event starts at 0:00 (multiday), and the next at 9:00, only use 2 hour space diff
    - [ ] If an event ends at 23:59 (multiday), and the last normal event ends at 18:00, only use 2 hour space diff
- [x] allign appointments > appointments starting at 14 o'clock are all on the same hight, if on the same day (and below the ones starting at 9 o'clock, if excists)


Usefull docs:

- https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/
