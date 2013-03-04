with (scope('DeveloperBox','Issue')) {

  define('create', function(issue) {
    DeveloperBox.issue = issue;
    DeveloperBox.error_message_div = div();

    DeveloperBox.inner_div = div({ id: 'dev-box-inner' });
    DeveloperBox.outer_div = div({ id: 'dev-box' },
      ribbon_header("Developers"),
      br,
      DeveloperBox.error_message_div,
      DeveloperBox.inner_div
    );

    DeveloperBox.start_work_div = div({ id: 'start-work' },
      info_message("Want to earn the bounty on this issue? Submit a solution!"),
      a({ id: 'create-solution', 'class': 'green', href: create_solution }, 'Start Work'),

      issue.solutions && issue.solutions.length <= 0 && p({ style: 'font-size: 14px; font-style: italic; margin-bottom: 0;'},
        'Be the first developer to start working on a solution!'
      ),

      issue.solutions && issue.solutions.length > 0 && p({ style: 'font-size: 14px; font-style: italic; margin-bottom: 0;'},
        formatted_number(issue.solutions.length),
        (issue.solutions.length == 1 ? ' developer has started' : ' developers have'),
        span(' started working on this.')
      )
    );

    reload_content();

    return DeveloperBox.outer_div;
  });

  define('reload_content', function() {
    render({ target: this.inner_div }, 'Loading...');

    if (logged_in()) {
      BountySource.get_solutions(function(response) {
        if (response.meta.success) {
          var my_solution;
          for (var i=0; i<response.data.length; i++) {
            if (response.data[i].issue.id) {
              my_solution = response.data[i];
              break;
            }
          }

          // cache the solution
          DeveloperBox.my_solution = my_solution;

          if (my_solution) {
            if (my_solution.accepted) {
              render({ into: DeveloperBox.inner_div }, success_message("Your solution has been accepted, congrats!"));
            } else if (my_solution.submitted) {
              render({ into: DeveloperBox.inner_div },
                success_message("Your submission has been submitted."),
                a({ 'class': 'green', href: curry(set_route, my_solution.frontend_path) }, "My Submission")
              );
            } else {
              render({ into: DeveloperBox.inner_div },
                info_message("You are currently working on a solution to this issue."),
                a({ 'class': 'green', href: my_solution.frontend_path }, "I'm Finished"),
                br,
                a({ 'class': 'gray', href: destroy_solution }, "Cancel")
              );
            }
          } else {
            render({ into: DeveloperBox.inner_div }, DeveloperBox.start_work_div);
          }
        } else {
          render({ target: this.inner_div }, error_message(response.data.error));
        }
      });
    } else {
      render({ into: DeveloperBox.inner_div }, DeveloperBox.start_work_div);
    }
  });

  // a message saying that the issue is in a dispute period
  define('solution_status_for_issue', function(issue) {
    DeveloperBox.solution_messages_div = div();
    DeveloperBox.issue = issue;

    // get all of the solutions that have been submitted...
    DeveloperBox.submitted_solutions = [];
    for (var i=0; i<issue.solutions.length; i++) if (issue.solutions[i].submitted) DeveloperBox.submitted_solutions.push(issue.solutions[i]);

    // ... Then pick the first solution submitted. TODO show ALL submitted solution
    var solution = DeveloperBox.submitted_solutions[0];

    // render content for when an accepted solution is present
    if (solution) {
      render({ into: DeveloperBox.solution_messages_div },
        div({ id: 'solution-status', style: 'text-align: center; padding: 10px 30px; background: #EBFFE4' },
          h2({ style: 'margin: 10px 0;' }, 'Solution Submitted'),

          div({ style: 'margin-bottom: 10px;' },
            'by ',
            a({ href: solution.person.profile_path },
              img({ style: 'display: inline-block; vertical-align: middle; width: 24px; height: 24px; border-radius: 2px;', src: solution.person.image_url }),
              div({ style: 'display: inline-block; vertical-align: middle; margin-left: 5px;' }, solution.person.display_name)
            )
          ),

          p('"' + solution.body + '"'),

          a({ href: solution.code_url, target: '_blank', 'class': 'blue', style: 'width: 200px; display: inline-block;' }, 'View Solution'),
          p({ style: 'line-height: 25px;' },
            "If you feel that this solution does not sufficiently solve the issue, file a ",
            a({ href: 'mailto:support@bountysource.com?subject=Dispute - Issue ID#'+solution.issue.id+'&body='+solution.issue.frontend_url }, 'dispute'),
            " with us. If there are no outstanding disputes after ",
            strong(formatted_date(solution.dispute_period_end_date)),
            ", then the solution will be accepted and the bounty paid out."
          )
        )
      );
    }

    return DeveloperBox.solution_messages_div;
  });

  define('create_solution', function() {
    render({ target: DeveloperBox.error_message_div },'');

    BountySource.create_solution(DeveloperBox.issue.id, function(response) {
      if (response.meta.success) {
        // set cached solution
        DeveloperBox.solution = response.data;
        set_route(DeveloperBox.solution.frontend_path);
      } else {
        render({ target: DeveloperBox.error_message_div }, small_error_message(response.data.error));
      }
    })
  });

  define('destroy_solution', function() {
    render({ target: DeveloperBox.error_message_div },'');

    BountySource.destroy_solution(DeveloperBox.my_solution.id, function(response) {
      if (response.meta.success) {
        DeveloperBox.my_solution = undefined;
        reload_content();
      } else {
        render({ target: DeveloperBox.error_message_div }, small_error_message(response.data.error));
      }
    });
  });

}