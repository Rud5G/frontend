with (scope('Submit', 'Solution')) {
  route('#solutions/:id/submit', function(id) {
    Submit.error_message_container = div(),
    Submit.target_div = div('Loading...');

    var breadrcrumbs_div = div(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Loading...'
      ),
      Submit.error_message_container,
      Submit.target_div
    );

    render(breadrcrumbs_div, Show.target_div);

    BountySource.get_solution(id, function(response) {
      if (response.meta.success) {
        Submit.solution = response.data;

        if (Submit.solution.submitted) return set_route(Submit.solution.frontend_path);

        var code_url_input = url({ required: true, name: 'code_url', style: 'width: 500px; font-size: 14px;' });
        var body_input = textarea({ required: true, name: 'body', style: 'width: 500px; height: 150px;' });

        code_url_input.addEventListener('blur', update_solution_event_callback);
        body_input.addEventListener('blur', update_solution_event_callback);

        // fill in the breadcrumbs
        render({ into: breadrcrumbs_div },
          breadcrumbs(
            a({ href: '#' }, 'Home'),
            a({ href: Submit.solution.issue.repository.frontend_path }, Submit.solution.issue.repository.full_name),
            a({ href: Submit.solution.issue.repository.frontend_path+'/issues' }, 'Issues'),
            a({ href: Submit.solution.issue.frontend_url }, '#'+Submit.solution.issue.number),
            a({ href: Submit.solution.frontend_path }, 'Solution'),
            'Submit'
          )
        );

        render({ into: Submit.target_div },
          form({ 'class': 'fancy', action: submit_solution },
            fieldset({ 'for': 'code_url' },
              label('Code URL:'),
              code_url_input
            ),
            fieldset({ 'for': 'body' },
              label('Submission Message:'),
              body_input
            ),
            fieldset({ 'class': 'no-label' },
              submit({ 'class': 'blue' }, 'Submit Code')
            )
          )
        );
      } else {
        render({ into: Submit.error_message_container }, error_message(response.data.error));
      }
    });
  });

  define('update_solution_event_callback', function() {
    var request_data = {};
    request_data[this.getAttribute('name')] = this.value;

    BountySource.update_solution(Submit.solution.id, request_data, function(response) {
      if (response.meta.success) {

      } else {
        render({ into: Submit.error_message_container }, error_message(response.data.error));
      }
    });
  });

  define('submit_solution', function() {
    render({ into: Submit.error_message_container }, '');

    BountySource.submit_solution(Submit.solution.id, function(response) {
      if (response.meta.success) {
        set_route(Submit.solution.frontend_path);
      } else {
        render({ into: Submit.error_message_container }, error_message(response.data.error));
      }
    })
  });
}