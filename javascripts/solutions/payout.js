with (scope('Payout','Solution')) {
  route('#solutions/:solution_id/payout', function(solution_id) {
    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#solutions' }, 'My Solutions'),
        'Loading...'
      ),
      'Loading...'
    );

    BountySource.get_solution(solution_id, function(response) {
      if (response.meta.success) {
        var solution = response.data;

        console.log(solution);

        // if the solution has not been accepted, render error and return
        if (!solution.accepted || solution.disputed) {
          render(error_message("Solution has not yet been accepted."));
        } else {
          var bounty_total      = solution.issue.bounty_total,
              bountysource_fee  = solution.bountysource_cut,
              developer_cut     = solution.developer_cut;

          render(
            breadcrumbs(
              a({ href: '#' }, 'Home'),
              a({ href: '#solutions' }, 'My Solutions'),
              a({ href: solution.frontend_path }, abbreviated_text(solution.issue.title, 50)),
              'Payout'
            ),

            form({ 'class': 'fancy' },
              fieldset(
                label('Bounty Total:'),
                div({ style: 'font-size: 30px; display: inline; vertical-align: middle;' }, money(bounty_total, true))
              ),

              fieldset(
                label('Processing Fee:'),
                div({ style: 'font-size: 30px; display: inline; vertical-align: middle;' }, money(bountysource_fee, true))
              ),

              fieldset({ style: 'line-height: 70px;' },
                label('Your Cut:'),
                div({ style: 'font-size: 70px; display: inline; vertical-align: middle;' }, money(developer_cut, true))
              ),

              fieldset({ 'class': 'no-label' },
                button({ 'class': 'green', style: 'width: 200px;' }, 'Collect ' + money(developer_cut, true))
              )
            )
          );
        }
      } else {
        render({ into: target_div }, error_message(response.data.error));
      }
    });
  });

  route('#solutions/:solution_id/payout/receipt', function(solution_id) {
    var target_div = div('Loading..');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        a({ href: '#solutions' }, 'My Solutions'),
        span({ id: 'solution-title' }, 'Loading...')
      ),
      target_div
    );

    BountySource.get_solution(solution_id, function(response) {
      if (response.meta.success) {
        var solution = response.data;

        render({ target: 'solution-title' }, abbreviated_text(solution.issue.title, 80));

        // if the solution has not been accepted, render error and return
        if (!solution.paid_out) return render({ into: target_div }, error_message("Solution has not yet been accepted."));

        render({ into: target_div },
          h2("Bounty Claimed!"),
          p("Thanks for your contribution to open source software. ")
        );
      } else {
        render({ into: target_div }, error_message(response.data.error));
      }
    });
  });

  define('payout', function(solution) {
    BountySource.payout_solution(solution.id, function(response) {
      if (response.meta.success) {

      } else {

      }
    });
  });
}