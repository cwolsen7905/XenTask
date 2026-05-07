import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useUI } from '../Contexts/UIContext';

export default function Calendar(events) {

  const { openModal } = useUI();

  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      //height={500} // Set the overall height of the calendar
      //aspectRatio={1} // Set a square aspect ratio
      expandRows={true} // Prevent rows from expanding to fill height
      handleWindowResize={true} // Automatically resize on window resize
      //windowResizeDelay={100} // Delay for resizing after window resize
      //stickyHeaderDates={true} // Fix date headers at the top
      //stickyFooterScrollbar={true} // Fix horizontal scrollbar at the bottom
      /*events={[
        { // this object will be "parsed" into an Event Object
          title: 'Test 1',
          start: '2024-09-01', 
          end: '2024-09-20',
          display: 'list-item',
          extendedProps:{
            task_id: 'asd123'
          }
        },
        { // this object will be "parsed" into an Event Object
          title: 'Test 2',
          start: '2024-09-01', 
          end: '2024-09-20',
          extendedProps:{
            task_id: 'asd123'
          }
        },
        { // this object will be "parsed" into an Event Object
          title: 'Test 3',
          start: '2024-09-01', 
          end: '2024-09-20',
          extendedProps:{
            task_id: 'asd123'
          }
        },
        { // this object will be "parsed" into an Event Object
          title: 'Test 4',
          start: '2024-09-01', 
          end: '2024-09-20',
          extendedProps:{
            task_id: 'asd123'
          }
        },
        { // this object will be "parsed" into an Event Object
          title: 'Test 5',
          start: '2024-09-01', 
          end: '2024-09-20',
          extendedProps:{
            task_id: 'asd123'
          } 
        },


      ]}*/
      events={events}
      eventClick={ function(info) {

          openModal(
              "View Task",
              {
                  type: 'taskView',
                  compProps: {
                      taskId: info.event.extendedProps.task_id,
                      taskName: info.event.title,
                      prevUrl: '/'
                  }
              },
              {
                  modalSize: 'modal-xxl',
                  scrollable: true,
              },
              {
                close: ()=>{ window.history.pushState({}, '', `/`)},
              }
          );

        window.history.pushState({}, '', `/task/${info.event.extendedProps.task_id}`);

        // change the border color just for fun
        info.el.style.borderColor = 'red';
      }}
    />
  );
}


