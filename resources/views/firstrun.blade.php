@extends('layouts.header')
<main class="py-4">
    <div class="container">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">{{ __('First run installation') }}</div>

                        <div class="card-body">
                            <h6 class="card-title">Database setup</h6>
                            <form method="POST" action="{{ route('install') }}/">
                                @csrf

                                <div class="form-group row">
                                    <label for="host" class="col-md-4 col-form-label text-md-right">{{ __('Host') }}</label>

                                    <div class="col-md-6">
                                        <input id="host" type="text" class="form-control @error('host') is-invalid @enderror" name="host" value="{{ old('host') }}" required autofocus>

                                        @error('host')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span>
                                        @enderror
                                    </div>
                                </div>

                                <div class="form-group row">
                                    <label for="username" class="col-md-4 col-form-label text-md-right">{{ __('User') }}</label>

                                    <div class="col-md-6">
                                        <input id="username" type="text" class="form-control @error('username') is-invalid @enderror" name="username" value="{{ old('username') }}" required autocomplete="username">

                                        @error('username')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span>
                                        @enderror
                                    </div>
                                </div>

                                <div class="form-group row">
                                    <label for="password" class="col-md-4 col-form-label text-md-right">{{ __('Password') }}</label>

                                    <div class="col-md-6">
                                        <input id="password" type="password" class="form-control @error('password') is-invalid @enderror" name="password" required autocomplete="password">

                                        @error('password')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span>
                                        @enderror
                                    </div>
                                </div>

                                <div class="form-group row">
                                    <label for="database" class="col-md-4 col-form-label text-md-right">{{ __('Database name') }}</label>

                                    <div class="col-md-6">
                                        <input id="database" type="text" class="form-control @error('database') is-invalid @enderror" name="database" required>
                                    </div>
                                </div>

                                <div class="form-group row mb-0">
                                    <div class="col-md-6 offset-md-4">
                                        <button type="submit" class="btn btn-primary">
                                            {{ __('Install') }}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>
@extends('layouts.footer')