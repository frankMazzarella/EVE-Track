import { getTestBed, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { IndexComponent } from './pages/core/index/index.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BaseRequestOptions, Http, HttpModule, XHRBackend } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Globals } from './shared/globals';
import { MockBackend } from '@angular/http/testing';
import * as expect from 'must/register';
import { Logger } from 'angular2-logger/core';
import { SinonStub, stub } from 'sinon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDropdownModule, ModalModule, TooltipModule } from 'ngx-bootstrap';
import { declarations } from './app.module';

describe('AppComponent', () => {

  let logger: Logger;
  let loggerStub: SinonStub;

  beforeEach(async function () {
    this.timeout(10000);

    TestBed.configureTestingModule({
      declarations: declarations,
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpModule,
        RouterTestingModule.withRoutes([
          {
            path: '',
            component: IndexComponent
          }
        ]),
        BsDropdownModule.forRoot(),
        TooltipModule.forRoot(),
        ModalModule.forRoot(),
      ],
      providers: [Globals,
        MockBackend,
        BaseRequestOptions,
        Logger,
        {
          provide: Http,
          deps: [MockBackend, BaseRequestOptions],
          useFactory: (backend: XHRBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backend, defaultOptions);
          }
        }
      ]
    });

    const testbed = getTestBed();

    logger = testbed.get(Logger);
    loggerStub = stub(logger, 'error');

  });

  afterEach(async function () {
    loggerStub.restore();
  });

  it('must create the app', async function () {
    this.timeout(10000);
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).to.be.truthy();
  });
});
