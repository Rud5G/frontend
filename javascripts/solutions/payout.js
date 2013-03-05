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

        // if the solution has not been accepted, render error and return
        if (!solution.accepted || solution.disputed) {
          render(error_message("Solution has not yet been accepted."));
        } else {
          var bounty_total      = parseFloat(solution.issue.bounty_total),
              bountysource_fee  = parseFloat(solution.bountysource_fee),
              processing_fee    = parseFloat(solution.processing_fee),
              eff_default       = parseFloat(solution.eff_default),
              fsf_default       = parseFloat(solution.fsf_default),
              spi_default       = parseFloat(solution.spi_default),
              dwb_default       = parseFloat(solution.dwb_default),
              developer_cut     = parseFloat(solution.developer_cut);

          var eff_slider = SliderWithInput.create({
            name: 'eff_donation_amount',
            min: 0,
            max: developer_cut,
            step: 0.01,
            value: eff_default||0
          });

          var fsf_slider = SliderWithInput.create({
            name: 'fsf_donation_amount',
            min: 0,
            max: developer_cut,
            step: 0.01,
            value: fsf_default||0
          });

          var spi_slider = SliderWithInput.create({
            name: 'spi_donation_amount',
            min: 0,
            max: developer_cut,
            step: 0.01,
            value: spi_default||0
          });

          var dwb_slider = SliderWithInput.create({
            name: 'dwb_donation_amount',
            min: 0,
            max: developer_cut,
            step: 0.01,
            value: dwb_default||0
          });

          var slider_group = SliderGroup.create({ min: 0, max: developer_cut },
            eff_slider,
            fsf_slider,
            spi_slider,
            dwb_slider
          );

          for (var i=0; i<slider_group.length; i++) {
            slider_group[i].addEventListener('SliderWithInputChange', function() {
              var charity_total = parseFloat(this.slider_group_sum);
              if (charity_total < 0) charity_total = 0;
              if (charity_total > developer_cut) charity_total = developer_cut;
              var new_developer_cut = developer_cut - charity_total;
              if (new_developer_cut < 0) new_developer_cut = 0;
              if (new_developer_cut > developer_cut) new_developer_cut = developer_cut;

              render({ target: 'charity-total' }, money(charity_total, true));
              render({ target: 'developer-cut' }, money(new_developer_cut, true));
            });
          }

          render(
            breadcrumbs(
              a({ href: '#' }, 'Home'),
              a({ href: '#solutions' }, 'My Solutions'),
              a({ href: solution.frontend_path }, abbreviated_text(solution.issue.title, 50)),
              'Payout'
            ),

            form({ action: payout },
              Columns.create({ show_side: true })
            ),

            Columns.main(
              form({ 'class': 'fancy' },
                fieldset(
                  p("Want to give back a little? Donate some or all of your bounty to the charities below.")
                ),

                fieldset(
                  label('The Electronic Frontier Foundation'),
                  span({ 'class': 'dollar-sign' }, '$'),
                  eff_slider
                ),
                fieldset(
                  label('Free Software Foundation'),
                  span({ 'class': 'dollar-sign' }, '$'),
                  fsf_slider
                ),
                fieldset(
                  label('Software in the Public Interest'),
                  span({ 'class': 'dollar-sign' }, '$'),
                  spi_slider
                ),
                fieldset(
                  label('Doctors Without Borders'),
                  span({ 'class': 'dollar-sign' }, '$'),
                  dwb_slider
                )
              )
            ),

            Columns.side(
              div({ id: 'solution-payout-info', style: 'margin-top: 110px;' },
                fieldset(
                  label('Bounty Total:'),
                  div({ style: 'font-size: 16px; display: inline; vertical-align: middle;' }, money(bounty_total, true))
                ),

                fieldset(
                  label('Processing Fee:'),
                  div({ style: 'font-size: 16px; display: inline; vertical-align: middle;' }, span('-'), money(processing_fee, true))
                ),

                fieldset(
                  label('BountySource Fee:'),
                  div({ style: 'font-size: 16px; display: inline; vertical-align: middle;' }, span('-'), money(bountysource_fee, true))
                ),

                fieldset(
                  label('Charity Donations:'),
                  div({ style: 'font-size: 16px; display: inline; vertical-align: middle;' },
                    span('-'),

                    span({ id: 'charity-total' },
                      money(eff_default + fsf_default + spi_default + dwb_default, true)
                    )
                  )
                ),

                fieldset(
                  label('Your Cut:'),
                  div({ style: 'font-size: 35px; display: inline; vertical-align: middle;' },
                    span({ id: 'developer-cut' },
                      money(developer_cut - eff_default - fsf_default - spi_default - dwb_default, true)
                    )
                  )
                ),

                fieldset({ style: 'text-align: center; margin-top: 30px;' },
                  button({ 'class': 'green', style: 'width: 200px;' }, 'Payout!')
                )
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

  define('payout', function(form_data) {
    BountySource.payout_solution(solution.id, form_data, function(response) {
      if (response.meta.success) {

      } else {

      }
    });
  });
}