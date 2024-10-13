# family-calendar

Custom Home Assistant card to display multiple calendars in a responsive version of a classical family calender. You know, the one with a column per person.

This is still under development and not ready to be used, but I wanted write issues and milestones to track my progress while working on the first version. That's why you allready find this reposiory.


## Open Todo's

### Rudimental functionallity
- [x] Create basic card JS framework code
- [x] Add basic calander HTML
- [x] Be able to configure number of columns, column title & calendars per column
- [x] Show events ...
  - [x] on the correct days
  - [x] multiple events same time
  - [ ] multi day events
    - [ ] starting before first visible day
    - [ ] ending after last visible day
- [ ] Show card in list of cards
- [ ] basic layout

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
- [x] allign appointments > appointments starting at 14 o'clock are all on the same hight, if on the same day (and below the ones starting at 9 o'clock, if excists)


Usefull docs:

- https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/
