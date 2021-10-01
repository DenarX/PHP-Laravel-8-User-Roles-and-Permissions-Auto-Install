<div class="col-xs-12 col-sm-12 col-md-12">
        <div class="text-center w-100">
            <strong>Permissions:</strong>
        </div>
        <div class="row">
            <div class="col-xs-4 col-sm-4 col-md-4">
                <div class="form-group">
                    <strong>User:</strong>
                    <br />
                    @foreach($permission as $value)
                    @php
                    $perm = explode('-',$value->name)[0];
                    @endphp
                    @if ($perm=='user')
                    <label>{{ Form::checkbox('permission[]', $value->id, in_array($value->id, $modelPermissions) ? true : false, array('class' => 'name')) }}{{ $value->name }}</label><br />
                    @endif
                    @endforeach
                </div>
            </div>
            <div class="col-xs-4 col-sm-4 col-md-4">
                <div class="form-group">
                    <strong>Role:</strong>
                    <br />
                    @foreach($permission as $value)
                    @php
                    $perm = explode('-',$value->name)[0];
                    @endphp
                    @if ($perm=='role')
                    <label>{{ Form::checkbox('permission[]', $value->id, in_array($value->id, $modelPermissions) ? true : false, array('class' => 'name')) }}{{ $value->name }}</label><br />
                    @endif
                    @endforeach
                </div>
            </div>
            <div class="col-xs-4 col-sm-4 col-md-4">
                <div class="form-group">
                    <strong>Product:</strong>
                    <br />
                    @foreach($permission as $value)
                    @php
                    $perm = explode('-',$value->name)[0];
                    @endphp
                    @if ($perm=='product')
                    <label>{{ Form::checkbox('permission[]', $value->id, in_array($value->id, $modelPermissions) ? true : false, array('class' => 'name')) }}{{ $value->name }}</label><br />
                    @endif
                    @endforeach
                </div>
            </div>
        </div>
    </div>
